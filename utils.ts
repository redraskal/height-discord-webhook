import Height, {FieldTemplateObject} from "height-app-api";

export const green = 0x03d723;
export const red = 0xd70303;
export const yellow = 0xd7d703;
export const white = 0xffffff;

export type TaskStatus = {
	name: string;
	color: number;
};

export async function taskStatus(height: Height, status: string): Promise<TaskStatus> {
	if (status == "backLog") {
		return {
			name: "To do",
			color: white,
		};
	}
	if (status == "done") {
		return {
			name: "Done",
			color: green,
		};
	}
	if (status == "inProgress") {
		return {
			name: "In Progress",
			color: yellow,
		};
	}
	const fieldTemplates = await height.fieldTemplates.all();
	const label = fieldTemplates.list.find((fieldTemplate: FieldTemplateObject) => fieldTemplate.type == "status")?.labels.find((label: FieldTemplateObject) => label.id == status);
	if (!label) {
		return {
			name: "Unknown",
			color: white,
		};
	}
	return {
		name: label.value,
		color: red, // TODO: use correct color
	};
}
