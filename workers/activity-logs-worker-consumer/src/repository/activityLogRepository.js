import prisma from "../config/db.js";

// get user by userId
export const getUserById = async (id) => {
  return await prisma.users.findFirst({
    where: {
      id
    },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      createdAt: true
    }
  });
};

// get project by projectId
// export const getProjectById = async (id, withDeleted = false) => {
//   const where = {
//     id,
//     ...(withDeleted ? {} : { deletedAt: null }), // hanya tambah filter jika tidak withDeleted
//   };
//   const result = await prisma.projects.findFirst({ where })
//   // console.log(result);
//   if (!result) {
//     return result
//   }
//   return ({
//     owner: result.owner,
//     projectId: result.id,
//     name: result.name,
//     createdAt: result.createdAt,
//     updatedAt: result.updatedAt
//   })
// };


// // get task by taskId
// export const getTaskById = async (id, withDeleted = false) => {
//   const where = {
//     id,
//     ...(withDeleted ? {} : { deletedAt: null }), // hanya tambah filter jika tidak withDeleted
//   };

//   const result = await prisma.tasks.findFirst({
//     where,
//   });

//   return result;
// };

// save log data
export const createLog = async (data) => {
  return await prisma.activityLogs.create(data);
}