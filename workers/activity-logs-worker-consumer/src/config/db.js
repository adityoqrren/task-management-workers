import fs from "node:fs";
import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client.js'

const connectionString = `${process.env.DATABASE_URL}`
const isProduction = process.env.NODE_ENV === 'production';

const adapter = new PrismaPg({
    connectionString,
    max: 2,
    ssl: (isProduction)
        ? {
            ca: fs.readFileSync('./cert/ca.pem', 'utf8'),
            rejectUnauthorized: true,
        }
        : undefined,
})
const prisma = new PrismaClient({ adapter })

export default prisma;