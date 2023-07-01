import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProblem = async (problemId: string) => {
  try {
    const codingProblem = await prisma.codingProblem.findUnique({
      where: {
        id: problemId
      },
      include: {
        authors: {
          select: {
            username: true
          }
        },
        tags: {
          select: {
            tagId: true
          }
        }
      }
    });

    return codingProblem;
  } catch (error) {
    //console.log(error);
    throw error;
  }
};

type GetProblemsParam = {
  category: string | null;
  startDif: number | null;
  endDif: number | null;
  tagList: Array<string>;
  page: number | null;
  q: string | null;
};

export const getCodingProblems = async (params: GetProblemsParam) => {
  try {
    //const params : GetProblemsParam = req.body;

    const { category, startDif, endDif, tagList, page, q } = params;

    const pageNum = page == undefined ? 1 : Number(page);

    const skip = (pageNum - 1) * 20;

    let tags: Array<number> = [];

    if (tagList != undefined)
      tags = tagList.map((item: string) => Number(item));

    console.log(tags);
    const filter = {
      categoryId:
        category != undefined && category != null
          ? Number(category)
          : undefined,
      difficulty: {
        lte: endDif != undefined && endDif != null ? Number(endDif) : undefined,
        gte:
          startDif != undefined && startDif != null
            ? Number(startDif)
            : undefined
      },
      tags: tags.length>0? {
        some: {
          tagId: {
            in: tags,
          }
        }
      }:undefined
    };
    console.log(filter);
    const problems = await prisma.codingProblem.findMany({
      skip: skip,
      take: 20,
      select: {
        id: true,
        title: true,
        category: {
          select: {
            name: true
          }
        },
        difficulty: true,
        practicePoint: true,
        acceptedNumber: true,
        submissionNumber: true
      },
      where: filter,
      orderBy:
        q != undefined
          ? ({
              _relevance: {
                fields: ['title'],
                search: q as string,
                sort: 'desc'
              }
            } as any)
          : undefined
    });

    const total = await prisma.codingProblem.count({
      where: filter
    });
    const totalPage = Math.floor(total / 20) + (total % 20 == 0 ? 0 : 1);

    return {
      problems: problems,
      totalPage: totalPage,
      total: total
    };
  } catch (error) {
    throw error;
  }
};

export const getCategoriesAndTags = async () => {
  try {
    const categories = await prisma.codingProblemCategory.findMany();
    const tags = await prisma.codingProblemTag.findMany();
    return {
      categories: categories,
      tags: tags
    };
  } catch (error) {
    throw error;
  }
};
