-- CreateTable
CREATE TABLE "CodeforcesTag" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "parentId" STRING,

    CONSTRAINT "CodeforcesTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodefocesTagProblem" (
    "problemId" STRING NOT NULL,
    "codeforcesTagId" STRING NOT NULL,

    CONSTRAINT "CodefocesTagProblem_pkey" PRIMARY KEY ("problemId","codeforcesTagId")
);

-- AddForeignKey
ALTER TABLE "CodefocesTagProblem" ADD CONSTRAINT "CodefocesTagProblem_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "CodingProblem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodefocesTagProblem" ADD CONSTRAINT "CodefocesTagProblem_codeforcesTagId_fkey" FOREIGN KEY ("codeforcesTagId") REFERENCES "CodeforcesTag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
