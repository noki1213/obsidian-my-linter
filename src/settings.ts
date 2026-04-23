export interface RuleConfig {
	enabled: boolean;
}

export interface MyLinterSettings {
	lintOnSave: boolean;
	lintOnFileChange: boolean;
	rules: {
		periodNewline: RuleConfig;
	};
}

export const DEFAULT_SETTINGS: MyLinterSettings = {
	lintOnSave: false,
	lintOnFileChange: false,
	rules: {
		periodNewline: { enabled: true },
	},
};
