import type { PrismaClient } from "@prisma/client";
import { rematchSetType } from "../setType";

/** Promote stored Set.type toward club / livestream / live-from-festival. */
export async function rematchCatalogSetTypes(
  prisma: PrismaClient,
): Promise<number> {
  const rows = await prisma.set.findMany({
    select: {
      id: true,
      title: true,
      type: true,
      event: { select: { kind: true } },
    },
  });
  let n = 0;
  for (const row of rows) {
    const next = rematchSetType(row.type, row.title, row.event?.kind);
    if (!next) continue;
    await prisma.set.update({
      where: { id: row.id },
      data: { type: next },
    });
    n += 1;
  }
  return n;
}
