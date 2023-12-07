/*
* This program and the accompanying materials are made available under the terms of the
* Eclipse Public License v2.0 which accompanies this distribution, and is available at
* https://www.eclipse.org/legal/epl-v20.html
*
* SPDX-License-Identifier: EPL-2.0
*
* Copyright IBM Corp, 2019
*
*/
import { SubtaskWithStatus } from "../../../src/api/BundlePush/SubtaskWithStatus";
import { TaskStage, ITaskWithStatus, TaskProgress } from "@zowe/imperative";


let parentTask: ITaskWithStatus;

describe("SubtaskWithStatus", () => {

    beforeEach(() => {
        parentTask =  {
            percentComplete: 0,
            statusMessage: "status",
            stageName: TaskStage.IN_PROGRESS
        };
    });
    it("Should fail with ticks < 0", () => {
        expect(() => {
            const task = new SubtaskWithStatus(parentTask, -1);
        }).toThrow("Ticks must be between 0 and 100");
    });

    it("Should fail with ticks > 0", () => {
        expect(() => {
            // eslint-disable-next-line no-magic-numbers
            const task = new SubtaskWithStatus(parentTask, 101);
        }).toThrow("Ticks must be between 0 and 100");
    });

    it("Should set the parent task status", () => {
        // eslint-disable-next-line no-magic-numbers
        const subTask = new SubtaskWithStatus(parentTask, 20);
        subTask.statusMessage = "Message from subtask";
        expect(parentTask.statusMessage).toEqual("Message from subtask");
    });

    it("Should set the parent task stage", () => {
        // eslint-disable-next-line no-magic-numbers
        const subTask = new SubtaskWithStatus(parentTask, 20);
        subTask.stageName = TaskStage.FAILED;
        expect(parentTask.stageName).toEqual(TaskStage.FAILED);
    });

    it("Should not set the parent task to completed", () => {
        // eslint-disable-next-line no-magic-numbers
        const subTask = new SubtaskWithStatus(parentTask, 20);
        subTask.stageName = TaskStage.COMPLETE;
        expect(parentTask.stageName).toEqual(TaskStage.IN_PROGRESS);
    });

    it("Should not set the parent task to NOT_STARTED", () => {
        // eslint-disable-next-line no-magic-numbers
        const subTask = new SubtaskWithStatus(parentTask, 20);
        subTask.stageName = TaskStage.NOT_STARTED;
        expect(parentTask.stageName).toEqual(TaskStage.IN_PROGRESS);
    });

    it("should set percentComplete on parent task using scaled value", () => {
        // eslint-disable-next-line no-magic-numbers
        const subTask = new SubtaskWithStatus(parentTask, 20);
        subTask.percentComplete = TaskProgress.FIFTY_PERCENT;
        expect(parentTask.percentComplete).toEqual(TaskProgress.TEN_PERCENT);
    });

    it("should add to percentComplete on parent task using scaled value", () => {
        // eslint-disable-next-line no-magic-numbers
        const subTask = new SubtaskWithStatus(parentTask, 40);
        parentTask.percentComplete = 50;
        subTask.percentComplete = TaskProgress.FIFTY_PERCENT;
        expect(parentTask.percentComplete).toEqual(TaskProgress.SEVENTY_PERCENT);
    });

    it("should add to percentComplete on parent task using scaled value multiple times", () => {
        // eslint-disable-next-line no-magic-numbers
        const subTask = new SubtaskWithStatus(parentTask, 40);
        parentTask.percentComplete = TaskProgress.FIFTY_PERCENT;
        subTask.percentComplete = 25;
        subTask.percentComplete = 50;
        subTask.percentComplete = 75;
        expect(parentTask.percentComplete).toEqual(TaskProgress.EIGHTY_PERCENT);
    });

    it("should return subtask percentage complete", () => {
        // eslint-disable-next-line no-magic-numbers
        const subTask = new SubtaskWithStatus(parentTask, 40);
        subTask.percentComplete = 50;
        // eslint-disable-next-line no-magic-numbers
        expect(subTask.percentComplete).toEqual(50);
    });

    it("should allow really small increments", () => {
        // eslint-disable-next-line no-magic-numbers
        const subTask = new SubtaskWithStatus(parentTask, 40);
        subTask.percentComplete = 50;
        // eslint-disable-next-line no-magic-numbers
        for (let i = 0; i < 40; i++) {
            subTask.percentComplete += 0.25;
        }
        // eslint-disable-next-line no-magic-numbers
        expect(parentTask.percentComplete).toBeCloseTo(24);

    });

    it("should return subtask stage", () => {
        // eslint-disable-next-line no-magic-numbers
        const subTask = new SubtaskWithStatus(parentTask, 40);
        subTask.stageName = TaskStage.IN_PROGRESS;
        expect(subTask.stageName).toEqual(TaskStage.IN_PROGRESS);
    });

    it("should return subtask status message", () => {
        // eslint-disable-next-line no-magic-numbers
        const subTask = new SubtaskWithStatus(parentTask, 40);
        subTask.statusMessage = "Status";
        expect(subTask.statusMessage).toEqual("Status");
    });
});
