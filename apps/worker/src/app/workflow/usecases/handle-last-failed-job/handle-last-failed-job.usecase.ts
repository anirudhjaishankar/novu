import { Injectable, Logger } from '@nestjs/common';
import { JobRepository } from '@novu/dal';
import { ExecutionDetailsSourceEnum, ExecutionDetailsStatusEnum } from '@novu/shared';
import * as Sentry from '@sentry/node';
import {
  CreateExecutionDetails,
  CreateExecutionDetailsCommand,
  DetailEnum,
  InstrumentUsecase,
} from '@novu/application-generic';

import { HandleLastFailedJobCommand } from './handle-last-failed-job.command';

import { QueueNextJob, QueueNextJobCommand } from '../queue-next-job';
import { SendMessage, SendMessageCommand } from '../send-message';
import { PlatformException } from '../../../shared/utils';
import { NotFoundError } from 'rxjs';

const LOG_CONTEXT = 'HandleLastFailedJob';

@Injectable()
export class HandleLastFailedJob {
  constructor(
    private createExecutionDetails: CreateExecutionDetails,
    private queueNextJob: QueueNextJob,
    private jobRepository: JobRepository
  ) {}

  /**
   * This use case is only meant to be executed when a backed off job is in the last of the retry
   * attempts allowed and has also failed.
   * We isolate it here as is a use case we would need to do a DB call and it will help to minimize
   * the amount of times that call will be made.
   */
  @InstrumentUsecase()
  public async execute(command: HandleLastFailedJobCommand): Promise<void> {
    const { jobId, error } = command;

    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      const message = `Job ${jobId} not found when handling the failure of the latest attempt for a backed off job`;
      Logger.error(message, new NotFoundError(message), LOG_CONTEXT);
      throw new PlatformException(message);
    }

    await this.createExecutionDetails.execute(
      CreateExecutionDetailsCommand.create({
        ...CreateExecutionDetailsCommand.getDetailsFromJob(job),
        detail: DetailEnum.WEBHOOK_FILTER_FAILED_LAST_RETRY,
        source: ExecutionDetailsSourceEnum.WEBHOOK,
        status: ExecutionDetailsStatusEnum.PENDING,
        isTest: false,
        isRetry: true,
        raw: JSON.stringify({ message: JSON.parse(error.message).message }),
      })
    );

    if (!job?.step?.shouldStopOnFail) {
      await this.queueNextJob.execute(
        QueueNextJobCommand.create({
          parentId: job?._id,
          environmentId: job?._environmentId,
          organizationId: job?._organizationId,
          userId: job?._userId,
        })
      );
    }
  }
}
