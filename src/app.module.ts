import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsController } from './posts/posts.controller';
import { AccountsModule } from './accounts/accounts.module';
import { PostsModule } from './posts/posts.module';
import { ImageModule } from './image/image.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmAsyncConfig } from './config/typeorm.config';
import { FileModule } from './file/file.module';
import { AuthModule } from './auth/auth.module';
import { QuizModule } from './quiz/quiz.module';
import { EventRegisterModule } from './event_register/event_register.module';
import { EmailModule } from './email/email.module';
import { QrModule } from './qr/qr.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    PostsModule,
    AccountsModule,
    ImageModule,
    FileModule,
    AuthModule,
    QuizModule,
    EventRegisterModule,
    EmailModule,
    QrModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
