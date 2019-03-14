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

import { Logger, ICommandHandler, IHandlerParameters, ICommandArguments, ImperativeError } from "@brightside/imperative";
import { BundleParentHandler } from "../../shared/BundleParent.handler";
import { BundleDeployer } from "../../../api/BundleDeploy/BundleDeployer";

/**
 * Command handler for undeploying a bundle
 * @export
 * @class UndeployBundleHandler
 * @implements {ICommandHandler}
 */
export default class UndeployBundleHandler extends BundleParentHandler implements ICommandHandler {

    public actionName = "undeployment";

    /**
     * Perform the UNDEPLOY BUNDLE action.
     *
     * @param {IHandlerParameters} params
     * @returns {Promise<string>}
     * @throws ImperativeError
     * @memberof UndeployBundleHandler
     */
    public async performAction(params: IHandlerParameters): Promise<string> {
       const bdep = new BundleDeployer(params);
       const msg = await bdep.undeployBundle();
       return msg;
    }
}
