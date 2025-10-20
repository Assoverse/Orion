import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { DnsProvider, DnsRecordSummary } from "./DnsProvider.js";

interface WildcardProviderOptions {
  baseDomain: string;
  routesFile?: string;
}

type RouteMap = Record<string, string>;

export class WildcardProvider implements DnsProvider {
  private readonly routesFile: string;

  constructor(private readonly options: WildcardProviderOptions) {
    const defaultDir = path.resolve(process.cwd(), ".orion");
    this.routesFile =
      options.routesFile ??
      path.join(defaultDir, `routes-${options.baseDomain}.json`);
  }

  async create(subdomain: string, ip: string): Promise<void> {
    const routes = await this.load();
    routes[this.fqdn(subdomain)] = ip;
    await this.persist(routes);
  }

  async delete(subdomain: string): Promise<void> {
    const routes = await this.load();
    delete routes[this.fqdn(subdomain)];
    await this.persist(routes);
  }

  async list(): Promise<DnsRecordSummary[]> {
    const routes = await this.load();
    return Object.entries(routes).map(([name, value]) => ({
      name,
      type: "A",
      value,
    }));
  }

  private async load(): Promise<RouteMap> {
    try {
      const raw = await readFile(this.routesFile, "utf-8");
      return JSON.parse(raw) as RouteMap;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return {};
      }
      throw error;
    }
  }

  private async persist(routes: RouteMap) {
    const dir = path.dirname(this.routesFile);
    await mkdir(dir, { recursive: true });
    await writeFile(this.routesFile, JSON.stringify(routes, null, 2), "utf-8");
  }

  private fqdn(subdomain: string): string {
    if (!subdomain) {
      return this.options.baseDomain;
    }
    return `${subdomain}.${this.options.baseDomain}`;
  }
}
