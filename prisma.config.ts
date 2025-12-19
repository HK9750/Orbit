import { defineConfig, env } from '@prisma/config';
import 'dotenv/config';

export default defineConfig({
    schema: 'libs/common/src/prisma/schema.prisma',
    migrations: {
        path: 'libs/common/src/prisma/migrations',
        seed: 'tsx libs/common/src/prisma/seed.ts'
    },
    datasource: {
        url: env('DATABASE_URL')
    }
});
