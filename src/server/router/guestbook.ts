import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";

export const guestbookRouter = createRouter()
  .query("getAll", {
    async resolve({ ctx }) {
      try {
        return await ctx.prisma.guestbook.findMany({
          select: {
            name: true,
            massage: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });
      } catch (error) {
        console.log("error", error);
      }
    },
  })
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next();
  })
  .mutation("postMessage", {
    input: z.object({
      name: z.string(),
      message: z.string(),
    }),
    async resolve({ ctx, input }) {
      try {
        await ctx.prisma.guestbook.create({
          data: {
            name: input.name,
            massage: input.message,
          },
        });
      } catch (error) {
        console.log(error);
      }
    },
  });
