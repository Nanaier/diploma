// src/events/validators/is-after.validator.ts
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isAfter', async: false })
export class IsAfter implements ValidatorConstraintInterface {
  validate(propertyValue: string, args: ValidationArguments) {
    return new Date(propertyValue) > new Date(args.object[args.constraints[0]]);
  }

  defaultMessage(args: ValidationArguments) {
    return `End date must be after ${args.constraints[0]}`;
  }
}
