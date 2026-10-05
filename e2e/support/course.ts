import { lessons } from '../../src/lib/content/course';

/** The lesson with a listening question that the screens and journeys needing one all use. */
export const listeningLesson = lessons.find((l) =>
	l.exercises.some((e) => e.listening && e.id.startsWith('listen:'))
)!;

/** Where in that lesson the first listening question comes. */
export const listenAt = listeningLesson.exercises.findIndex((e) => e.listening);
