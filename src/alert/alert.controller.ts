import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ReceiveAlertDto } from './dto/receive-alert.dto';
import { AlertService } from './alert.service';

@ApiTags('alerts')
@Controller('alerts')
export class AlertController {
  private readonly logger = new Logger(AlertController.name);

  constructor(private readonly alertService: AlertService) {}

  @Post()
  @ApiOperation({ summary: 'Receive an alert from TradingView' })
  @ApiBody({
    type: ReceiveAlertDto,
    description: 'The alert data sent by TradingView',
  })
  receiveAlert(@Body() alertData: ReceiveAlertDto) {
    this.logger.log('Receiving an alert from TradingView');
    this.alertService.notify(alertData.test);
  }
}
