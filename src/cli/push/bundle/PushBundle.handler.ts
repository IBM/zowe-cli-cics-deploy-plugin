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

import { ICommandHandler, IHandlerParameters } from "@brightside/imperative";
import { BundleParentHandler } from "../../shared/BundleParent.handler";
import { BundlePusher } from "../../../api/BundlePush/BundlePusher";

/**
 * Command handler for pushing a bundle
 * @export
 * @class GenerateBundleHandler
 * @implements {ICommandHandler}
 */
export default class PushBundleHandler extends BundleParentHandler implements ICommandHandler {

    public actionName = "pushing";

    /**
     * Perform the PUSH BUNDLE action.
     *
     * @param {IHandlerParameters} params
     * @returns {Promise<string>}
     * @throws ImperativeError
     * @memberof DeployBundleHandler
     */
    public async performAction(params: IHandlerParameters): Promise<string> {

      const pusher = await new BundlePusher(params, process.cwd());
      return pusher.performPush();
    }
}
