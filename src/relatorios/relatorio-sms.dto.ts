import { IsDateString } from 'class-validator';
import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

function IsAfterOrEqual(property: string, options?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isAfterOrEqual',
      target: (object as any).constructor,
      propertyName,
      constraints: [property],
      options: { message: `${propertyName} deve ser maior ou igual a ${property}`, ...options },
      validator: {
        validate(value: string, args: ValidationArguments) {
          const [relatedProperty] = args.constraints;
          const relatedValue = (args.object as any)[relatedProperty];
          if (!value || !relatedValue) return true;
          return new Date(value) >= new Date(relatedValue);
        },
      },
    });
  };
}

export class RelatorioSmsQueryDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsAfterOrEqual('startDate')
  endDate: string;
}
