import { Modal, type App } from "obsidian";

/**
 * Asks before deleting a note together with its replies. Resolves true when
 * the user confirms, false when they cancel or close the dialog.
 */
export function confirmThreadDeletion(app: App, title: string, replyCount: number): Promise<boolean> {
	return new Promise((resolve) => new ConfirmDeleteModal(app, title, replyCount, resolve).open());
}

class ConfirmDeleteModal extends Modal {
	private confirmed = false;

	constructor(
		app: App,
		private readonly noteTitle: string,
		private readonly replyCount: number,
		private readonly resolve: (confirmed: boolean) => void
	) {
		super(app);
	}

	onOpen() {
		const replies = this.replyCount === 1 ? "1 reply" : `${this.replyCount} replies`;
		this.setTitle("Delete thread");
		this.contentEl.createEl("p", {
			text: `Are you sure you want to delete "${this.noteTitle}" and its ${replies}?`,
		});

		const buttons = this.modalEl.createDiv({ cls: "modal-button-container" });
		const deleteButton = buttons.createEl("button", { cls: "mod-warning", text: "Delete" });
		deleteButton.addEventListener("click", () => {
			this.confirmed = true;
			this.close();
		});
		buttons
			.createEl("button", { cls: "mod-cancel", text: "Cancel" })
			.addEventListener("click", () => this.close());
		deleteButton.focus();
	}

	onClose() {
		this.contentEl.empty();
		this.resolve(this.confirmed);
	}
}
