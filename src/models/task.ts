import { validateDateString } from "./course";
import { TaskCreationError } from "./errors";

export class Task {
    id: string;
    course_id: string;
    created_by: string;
    type: 'tarea' | 'examen';
    title: string;
    description: string;
    instructions: string;
    due_date: string;
    allow_late: boolean;
    late_policy: 'ninguna' | 'descontar' | 'penalizar' | 'aceptar' | 'aceptar_con_descuento' | 'aceptar_con_penalizacion';
    has_timer: boolean;
    time_limit_minutes?: number | null;
    published: boolean;
    visible_from?: string | null;
    visible_until?: string | null;
    allow_file_upload: boolean;
    answer_format: 'texto' | 'opcion_multiple' | 'archivo' | 'mixto';
    created_at?: string | null;
    updated_at?: string | null;
    deleted_at?: string | null;

    constructor(data: Partial<Task>) {
        if(!data.created_by) throw new TaskCreationError('The "created_by" field is required.');
        if(!data.type) throw new TaskCreationError('The "type" field is required.');
        if(!data.title) throw new TaskCreationError('The "title" field is required.');
        if(!data.description) throw new TaskCreationError('The "description" field is required.');
        if(!data.instructions) throw new TaskCreationError('The "instructions" field is required.');
        if(!data.due_date) throw new TaskCreationError('The "due_date" field is required.');
        if(data.allow_late == undefined) throw new TaskCreationError('The "allow_late" field is required.');
        if(!data.late_policy) throw new TaskCreationError('The "late_policy" field is required.');
        if(data.has_timer === undefined) throw new TaskCreationError('The "has_timer" field is required.');
        if(data.published === undefined) throw new TaskCreationError('The "published" field is required.');
        if(data.allow_file_upload === undefined) throw new TaskCreationError('The "allow_file_upload" field is required.');
        if(!data.answer_format) throw new TaskCreationError('The "answer_format" field is required.');

        this.id = data.id || '';
        this.course_id = data.course_id || '';
        this.created_by = data.created_by;
        this.type = data.type;
        this.title = data.title;
        this.description = data.description;
        this.instructions = data.instructions;
        this.due_date = validateDateString(data.due_date, "due_date");
        this.allow_late = data.allow_late;
        this.late_policy = data.late_policy;
        this.has_timer = data.has_timer;
        this.published = data.published;
        this.allow_file_upload = data.allow_file_upload;
        this.answer_format = data.answer_format;
        this.time_limit_minutes = data.time_limit_minutes ?? null;
        this.visible_from = data.visible_from ? validateDateString(data.visible_from, "visible_from") : null;
        this.visible_until = data.visible_until ? validateDateString(data.visible_until, "visible_until") : null;
        this.created_at = data.created_at ? validateDateString(data.created_at, "created_at") : null;
        this.updated_at = data.updated_at ? validateDateString(data.updated_at, "updated_at") : null;
        this.deleted_at = data.deleted_at ? validateDateString(data.deleted_at, "deleted_at") : null;
    }
}
