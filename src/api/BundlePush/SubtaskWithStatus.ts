import { ITaskWithStatus, TaskProgress, TaskStage, ImperativeExpect, ImperativeError} from "@zowe/imperative";


export class SubtaskWithStatus {

    private parent: ITaskWithStatus;
    private ticks: number;
    private percentCompleteInternal: number;

    constructor(parent: ITaskWithStatus, ticks: number) {
        this.parent = parent;
        this.ticks = ticks;
        this.percentCompleteInternal = 0;
        if (this.ticks < 0 || this.ticks > TaskProgress.ONE_HUNDRED_PERCENT) {
            throw new ImperativeError({msg: "Ticks must be between 0 and 100"});
        }
    }

    public set statusMessage(statusMessage: string) {
        this.parent.statusMessage = statusMessage;
    }

    public set stageName(stageName: TaskStage) {
        if (stageName !== TaskStage.COMPLETE && stageName !== TaskStage.NOT_STARTED) {
            this.parent.stageName = stageName;
        }
    }

    public set percentComplete(percentComplete: number) {
        const delta = percentComplete - this.percentCompleteInternal;
        this.percentCompleteInternal = percentComplete;
        this.parent.percentComplete = this.parent.percentComplete + delta * (this.ticks / TaskProgress.ONE_HUNDRED_PERCENT);
    }

    public get percentComplete() {
        return this.percentCompleteInternal;
    }
}
