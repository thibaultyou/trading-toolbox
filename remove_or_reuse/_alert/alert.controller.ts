// import { Body, Controller, Post } from '@nestjs/common';
// import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

// import { BaseController } from '../common/base/base.controller';
// import { AlertService } from './alert.service';
// import { ReceiveAlertDto } from './dto/receive-alert.dto';
// import { AlertReceiveException } from './exceptions/alert.exceptions'; // assuming this exists

// @ApiTags('alerts')
// @Controller('alerts')
// export class AlertController extends BaseController {
//   constructor(private readonly alertService: AlertService) {
//     super('AlertController');
//   }

//   @Post()
//   @ApiOperation({ summary: 'Receive an alert from TradingView' })
//   @ApiBody({
//     type: ReceiveAlertDto,
//     description: 'The alert data sent by TradingView',
//   })
//   async receiveAlert(@Body() alertData: ReceiveAlertDto) {
//     try {
//       this.alertService.notify(alertData);
//     } catch (error) {
//       throw new AlertReceiveException(error.message);
//     }
//   }
// }
