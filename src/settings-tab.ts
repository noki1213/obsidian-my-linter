import { App, PluginSettingTab, Setting } from 'obsidian';
import type MyLinterPlugin from './main';

export class MyLinterSettingTab extends PluginSettingTab {
	plugin: MyLinterPlugin;

	constructor(app: App, plugin: MyLinterPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// --- General settings ---
		containerEl.createEl('h2', { text: '全般設定' });

		new Setting(containerEl)
			.setName('保存時に lint する')
			.setDesc('Cmd+S（または Ctrl+S）で保存したとき、自動で lint を実行する')
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.lintOnSave)
					.onChange(async value => {
						this.plugin.settings.lintOnSave = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('ファイル切り替え時に lint する')
			.setDesc('別のノートに移動したとき、直前のノートに対して自動で lint を実行する')
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.lintOnFileChange)
					.onChange(async value => {
						this.plugin.settings.lintOnFileChange = value;
						await this.plugin.saveSettings();
					})
			);

		// --- Rule settings ---
		containerEl.createEl('h2', { text: 'ルール' });

		new Setting(containerEl)
			.setName('。のあとに改行を入れる')
			.setDesc('句点（。）の直後に改行がない場合、自動で改行を追加する')
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.rules.periodNewline.enabled)
					.onChange(async value => {
						this.plugin.settings.rules.periodNewline.enabled = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
