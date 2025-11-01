import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Importa o ConfigService
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    // Etapa 1.3: Carrega o .env e torna as variáveis acessíveis
    ConfigModule.forRoot({
      isGlobal: true, // Torna as variáveis de ambiente globais
    }),

    // Etapa 1.3: Configura a conexão com o banco de dados PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Importa o ConfigModule
      inject: [ConfigService], // Injeta o ConfigService
      // A 'useFactory' agora usa o 'configService' injetado
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        // CORREÇÃO: Usando configService.get() para garantir que o valor exista
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: true,
      }),
    }),

    ReportsModule,
  ],
  controllers: [],
  providers: [],
})
// CORREÇÃO: Adicionando 'export' para que o main.ts possa importar
export class AppModule {}

