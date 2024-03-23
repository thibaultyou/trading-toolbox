// import { HttpException, HttpStatus } from '@nestjs/common';

// export class ActionNotFoundException extends HttpException {
//   constructor(id: string) {
//     super(`Action with id: ${id} not found`, HttpStatus.NOT_FOUND);
//   }
// }

// export class ActionCreateException extends HttpException {
//   constructor(error: string) {
//     super(`Error creating action: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
//   }
// }

// export class ActionUpdateException extends HttpException {
//   constructor(id: string, error: string) {
//     super(
//       `Error updating action with id: ${id}: ${error}`,
//       HttpStatus.INTERNAL_SERVER_ERROR,
//     );
//   }
// }

// export class ActionDeleteException extends HttpException {
//   constructor(id: string, error: string) {
//     super(
//       `Error deleting action with id: ${id}: ${error}`,
//       HttpStatus.INTERNAL_SERVER_ERROR,
//     );
//   }
// }
