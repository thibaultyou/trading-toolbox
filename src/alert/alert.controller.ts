import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ReceiveAlertDto } from './dto/receive-alert.dto';
import { AlertService } from './alert.service';

@ApiTags('alerts')
@Controller('alerts')
export class AlertController {
    constructor(private readonly alertService: AlertService) { }

    @Post()
    @ApiOperation({ summary: 'Receive an alert from TradingView' })
    @ApiBody({ type: ReceiveAlertDto, description: 'The alert data sent by TradingView' })
    receiveAlert(@Body() alertData: ReceiveAlertDto) {
        this.alertService.notify(alertData.test)
    }
}
