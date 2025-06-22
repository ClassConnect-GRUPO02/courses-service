/* istanbul ignore file */

export const mockTaskRequestData = {
  course_id: 'c1',
  created_by: 'u1',
  type: 'tarea' as const,
  title: 'Mock Task Title',
  description: 'Mock Task Description',
  due_date: '2023-10-01T00:00:00Z',
  allow_late: true,
  late_policy: 'ninguna' as const,
  has_timer: false,
  time_limit_minutes: null,
  published: true,
  allow_file_upload: true,
  answer_format: 'archivo' as const,
};