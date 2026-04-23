import { Editor, MarkdownView, Plugin, TFile } from 'obsidian';
import { DEFAULT_SETTINGS, MyLinterSettings } from './settings';
import { MyLinterSettingTab } from './settings-tab';
import { applyPeriodNewline } from './rules/period-newline';

export default class MyLinterPlugin extends Plugin {
	settings: MyLinterSettings;
	private lastActiveFile: TFile | null = null;
	private originalSaveCallback?: (checking: boolean) => boolean | void;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new MyLinterSettingTab(this.app, this));
		this.addLintCommand();
		this.registerSaveHook();
		this.registerFileChangeEvent();
	}

	async onunload() {
		// Restore the original save hook
		const saveCommand = (this.app as any).commands?.commands?.['editor:save-file'];
		if (saveCommand && this.originalSaveCallback) {
			saveCommand.checkCallback = this.originalSaveCallback;
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// Manually run lint from the command palette
	private addLintCommand() {
		this.addCommand({
			id: 'lint-file',
			name: '現在のファイルを lint する',
			editorCheckCallback: (checking, editor, ctx) => {
				if (checking) {
					return ctx.file?.extension === 'md';
				}
				this.lintEditor(editor);
			},
		});
	}

	// Hook linting into Cmd+S (save)
	private registerSaveHook() {
		const saveCommand = (this.app as any).commands?.commands?.['editor:save-file'];
		if (!saveCommand) return;

		this.originalSaveCallback = saveCommand.checkCallback;

		if (typeof this.originalSaveCallback === 'function') {
			saveCommand.checkCallback = (checking: boolean) => {
				if (checking) {
					return this.originalSaveCallback!(checking);
				}
				this.originalSaveCallback!(checking);
				if (this.settings.lintOnSave) {
					const editor = this.getEditor();
					if (editor) this.lintEditor(editor);
				}
			};
		}
	}

	// Lint the previous note when switching files
	private registerFileChangeEvent() {
		this.lastActiveFile = this.app.workspace.getActiveFile();
		this.registerEvent(
			this.app.workspace.on('active-leaf-change', async () => {
				const currentFile = this.app.workspace.getActiveFile();
				const prevFile = this.lastActiveFile;
				this.lastActiveFile = currentFile;

				if (!this.settings.lintOnFileChange) return;
				if (!prevFile || prevFile === currentFile) return;
				if (prevFile.extension !== 'md') return;

				try {
					await this.lintFile(prevFile);
				} catch (e) {
					console.error('[my-linter] lint エラー:', e);
				}
			})
		);
	}

	// Lint by reading and writing the file directly (used when switching files)
	private async lintFile(file: TFile) {
		const oldText = await this.app.vault.read(file);
		const newText = this.applyRules(oldText);
		if (oldText !== newText) {
			await this.app.vault.modify(file, newText);
		}
	}

	// Lint the text in the editor (used on save and on manual run)
	private lintEditor(editor: Editor) {
		const oldText = editor.getValue();
		const newText = this.applyRules(oldText);
		if (oldText !== newText) {
			editor.setValue(newText);
		}
	}

	// Apply the enabled rules in order
	private applyRules(text: string): string {
		if (this.settings.rules.periodNewline.enabled) {
			text = applyPeriodNewline(text);
		}
		return text;
	}

	private getEditor(): Editor | null {
		return this.app.workspace.getActiveViewOfType(MarkdownView)?.editor ?? null;
	}
}
