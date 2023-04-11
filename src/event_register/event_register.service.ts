import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateEventRegisterDto } from './dto/create-event_register.dto';
import { UpdateEventRegisterDto } from './dto/update-event_register.dto';
import { EmailService } from 'src/email/email.service';
const QR = require('qrcode');
import { Connection, Repository, getManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EventRegister } from './entities/event_register.entity';
import { Account } from 'src/accounts/entities/account.entity';
import { LINK } from 'src/contains';
import { Qr } from 'src/qr/entities/qr.entity';
@Injectable()
export class EventRegisterService {
  constructor(
    private readonly emailService: EmailService,
    private readonly connection: Connection,
    @InjectRepository(EventRegister)
    private readonly eventRepository: Repository<EventRegister>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Qr)
    private readonly qrRepository: Repository<Qr>,
  ) {}
  async create(createEventRegisterDto: CreateEventRegisterDto) {
    const queryRunner = this.connection.createQueryRunner();
    try {
      await queryRunner.startTransaction();
      const { account, post } = createEventRegisterDto;
      const accounts = await this.eventRepository.find({
        where: { account, post },
      });
      if (accounts.length > 0) {
        return {
          message: `You are registed, don't spam please !`,
          statusCode: HttpStatus.BAD_REQUEST,
        };
      }
      // SAVE EVENT REGISTER
      const id = await getManager().transaction(
        async (transactionalEntityManager) => {
          const event = await this.eventRepository.create(
            createEventRegisterDto,
          );
          const saveEvent = await transactionalEntityManager.save(event);
          const eventId = saveEvent.id;
          return eventId;
        },
      );
      const findAccount = await this.accountRepository.findOne({
        where: { id: account },
      });
      // FIND ACCOUNT TO GET EMAIL
      if (findAccount?.email && findAccount?.id) {
        const qr = await QR.toDataURL(`${LINK}/${post}/${findAccount?.id}`);
        const qrEntity = await this.qrRepository.create({
          qr_link: qr,
          account: findAccount?.id,
          events: id,
        });
        await queryRunner.manager.save(Qr, qrEntity);
        await this.emailService.sendEmail(
          findAccount?.email,
          'CAM ON BAN DA DANG KI',
          'Cam on ban da dang ki tham gia chuong trinh',
          qr,
        );
      }
      await queryRunner.commitTransaction();
      return {
        message: 'Register event successful !',
        statusCode: HttpStatus.CREATED,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    // try {
    //   this.emailService.sendEmail(
    //     'trieutien.mobile.dev@gmail.com',
    //     'hehe',
    //     'hehe',
    //   );
    //   return 'This action adds a new eventRegister';
    // } catch (error) {
    //   console.log(error);
    // }
  }

  findAll() {
    return `This action returns all eventRegister`;
  }

  async findOne(account: number, post: number) {
    const queryRunner = this.connection.createQueryRunner();
    try {
      await queryRunner.startTransaction();
      const event = await this.eventRepository.findOne({
        where: { account, post },
      });
      if (!event) {
        return {
          message: 'Tài khoản chưa đăng kí sự kiện !',
          statusCode: HttpStatus.NOT_FOUND,
        };
      }
      queryRunner.manager.update(
        EventRegister,
        { account, post },
        { status: true },
      );

      await queryRunner.commitTransaction();
      return {
        message: 'Điểm danh thành công !',
        statusCode: HttpStatus.ACCEPTED,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException('Create Account Fail !', HttpStatus.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }
  }

  update(id: number, updateEventRegisterDto: UpdateEventRegisterDto) {
    return `This action updates a #${id} eventRegister`;
  }

  remove(id: number) {
    return `This action removes a #${id} eventRegister`;
  }
}
