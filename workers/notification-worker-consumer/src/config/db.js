import fs from "node:fs";
import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client.js'

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({
    connectionString,
    max: 2,
    ssl: {
        ca: fs.readFileSync("./cert/ca.pem", "utf8"),
        rejectUnauthorized: true,
    },
})
const prisma = new PrismaClient({ adapter })

export default prisma;