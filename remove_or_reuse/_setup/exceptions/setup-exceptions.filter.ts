// import {
//   ArgumentsHost,
//   Catch,
//   ExceptionFilter,
//   HttpException,
// } from '@nestjs/common';
// import { Logger } from '@nestjs/common';
// import { Request, Response } from 'express';

// import {
//   SetupCreateException,
//   SetupDeleteException,
//   SetupFetchAllException,
//   SetupNotFoundException,
//   SetupUpdateException,
// } from './setup.exceptions';

// @Catch(
//   SetupNotFoundException,
//   SetupCreateException,
//   SetupUpdateException,
//   SetupDeleteException,
//   SetupFetchAllException,
// )
// export class SetupExceptionFilter implements ExceptionFilter {
//   private logger = new Logger(SetupExceptionFilter.name);

//   catch(exception: HttpException, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<Response>();
//     const request = ctx.getRequest<Request>();
//     const status = exception.getStatus();

//     const errorMessage = `Error: ${exception.message}`;

//     this.logger.error(errorMessage, exception.stack);

//     response.status(status).json({
//       statusCode: status,
//       timestamp: new Date().toISOString(),
//       path: request.url,
//       message: exception.message,
//     });
//   }
// }
