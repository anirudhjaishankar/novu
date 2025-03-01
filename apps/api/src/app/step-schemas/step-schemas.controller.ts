import { ClassSerializerInterceptor, Controller, Get, Query, UseInterceptors } from '@nestjs/common';

import { UserSessionData } from '@novu/shared';
import { ExternalApiAccessible, UserSession } from '@novu/application-generic';
import { StepType } from '@novu/framework';

import { createGetStepSchemaCommand } from './usecases/get-step-schema/get-step-schema.command';
import { UserAuthentication } from '../shared/framework/swagger/api.key.security';
import { GetStepSchema } from './usecases/get-step-schema/get-step-schema.usecase';
import { StepSchemaDto } from './dtos/step-schema.dto';

@Controller('/step-schemas')
@UserAuthentication()
@UseInterceptors(ClassSerializerInterceptor)
export class StepSchemasController {
  constructor(private getStepDefaultSchemaUsecase: GetStepSchema) {}

  @Get()
  @ExternalApiAccessible()
  async getWorkflowStepSchema(
    @UserSession() user: UserSessionData,
    @Query('stepType') stepType: StepType,
    @Query('workflowId') workflowId: string,
    @Query('stepId') stepId: string
  ): Promise<StepSchemaDto> {
    return await this.getStepDefaultSchemaUsecase.execute(
      createGetStepSchemaCommand(user, stepType, workflowId, stepId)
    );
  }
}
