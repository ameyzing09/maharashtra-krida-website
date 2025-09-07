export type ParsedTeamRow = {
  name: string;
  short?: string;
  logoUrl?: string;
  group?: string;
  seed?: number;
};

export async function parseTeamsXlsx(file: File): Promise<ParsedTeamRow[]> {
  const { read, utils } = await import("xlsx");
  const arrayBuf = await file.arrayBuffer();
  const wb = read(arrayBuf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: Record<string, unknown>[] = utils.sheet_to_json(ws, { defval: "" });

  const result: ParsedTeamRow[] = [];
  for (const r of rows) {
    const name = String(
      (r["Name"] ?? r["Team"] ?? r["Team Name"] ?? r["team"] ?? r["name"] ?? "")
    ).trim();
    if (!name) continue;
    const short = String(
      (r["Short"] ?? r["Code"] ?? r["Alias"] ?? r["short"] ?? r["code"] ?? "")
    ).trim() || undefined;
    const logoUrl = String(
      (r["Logo"] ?? r["Logo URL"] ?? r["LogoUrl"] ?? r["logo"] ?? "")
    ).trim() || undefined;
    const group = String((r["Group"] ?? r["group"] ?? "")).trim() || undefined;
    const seedRaw = (r["Seed"] ?? r["seed"]) as string | number | undefined;
    const seed = seedRaw === undefined || seedRaw === "" ? undefined : Number(seedRaw);
    result.push({ name, short, logoUrl, group, seed });
  }
  return result;
}

