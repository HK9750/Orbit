import { Global, Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from '@app/common';
import { validate } from '@app/common';

@Global()
@Module({})
export class AppConfigModule {
    static forRoot(): DynamicModule {
        return {
            module: AppConfigModule,
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: ['.env.local', '.env'],
                    validate,
                }),
            ],
            providers: [AppConfigService],
            exports: [AppConfigService],
        };
    }
}
