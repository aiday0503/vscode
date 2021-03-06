/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

var EntryPoint = (function() {
	function toArray(param) {
		if (!param) {
			return [];
		}
		if (!Array.isArray(param)) {
			return [param];
		}
		return param;
	}

	function EntryPoint(result, modules) {
		this.result = result;
		this.modules = toArray(modules);
	}
	EntryPoint.prototype.define = function(moduleId, excludes) {
		excludes = toArray(excludes);
		this.result.push({
			name: moduleId,
			exclude: ['vs/css', 'vs/nls', 'vs/text'].concat(this.modules).concat(excludes)
		});
		return new EntryPoint(this.result, this.modules.concat([moduleId].concat(excludes)));
	};
	EntryPoint.prototype.combine = function(other) {
		return new EntryPoint(this.result, this.modules.concat(other.modules));
	};
	return EntryPoint;
})();
exports.collectModules = function(args) {

	var result = [];
	var common = new EntryPoint(result, 'vs/editor/common/languages.common');
	var worker = new EntryPoint(result, ['vs/editor/common/languages.common', 'vs/base/common/worker/workerServer', 'vs/editor/common/worker/editorWorkerServer']);

	// ---- json ---------------------------------
	common.define('vs/languages/json/common/json')
		.combine(worker)
			.define('vs/languages/json/common/jsonWorker');

	// ---- typescript & javascript -----------------

	common.define('vs/languages/typescript/common/lib/typescriptServices');

	common.define('vs/languages/typescript/common/typescript', 'vs/languages/typescript/common/lib/typescriptServices');

	var EXCLUDES = ['vs/languages/typescript/common/lib/typescriptServices', 'vs/languages/typescript/common/typescript'];

	common.define('vs/languages/typescript/common/mode', EXCLUDES)
		.combine(worker)
			.define('vs/languages/typescript/common/worker', EXCLUDES);

	common.define('vs/languages/typescript/common/workerManager', EXCLUDES);

	return result;
};