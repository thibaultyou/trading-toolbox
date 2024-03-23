// import {
//   ArgumentsHost,
//   Catch,
//   ExceptionFilter,
//   HttpException,
// } from '@nestjs/common';
// import { Logger } from '@nestjs/common';
// import { Request, Response } from 'express';

// import {
//   ActionCreateException,
//   ActionDeleteException,
//   ActionNotFoundException,
//   ActionUpdateException,
// } from './action.exceptions';

// @Catch(
//   ActionNotFoundException,
//   ActionCreateException,
//   ActionUpdateException,
//   ActionDeleteException,
// )
// export class ActionExceptionFilter implements ExceptionFilter {
//   private logger = new Logger(ActionExceptionFilter.name);

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
