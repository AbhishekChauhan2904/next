import { defineModule } from '@/modules/define';
import Docs from './routes/docs.vue';
import sections, { Section, Divider, defaultSection } from './components/sections';
import { Route } from 'vue-router';
import { cloneDeep } from 'lodash';

function urlSplitter(url: string) {
	if (url.startsWith('/docs')) url = url.replace('/docs', '');
	if (url.startsWith('/')) url = url.substr(1);
	return url.split('/');
}

function urlToSection(urlSections: string[], sections: (Section | Divider)[]): Section | null {
	let section = sections.find((s) => 'to' in s && urlSplitter(s.to).pop() === urlSections[0]) as
		| Section
		| undefined;

	if (section === undefined) {
		return null;
	}

	section = cloneDeep(section);

	if (urlSections.length === 1) {
		let finalSection = section;
		let index = 0;
		while (finalSection.children !== undefined && finalSection.children.length < index) {
			if ('divider' in finalSection.children[index]) {
				index++;
			} else {
				index = 0;
				finalSection = finalSection.children[index] as Section;
			}
		}
		if (section.icon) finalSection.icon = section.icon;
		if (finalSection.sectionName === undefined) finalSection.sectionName = section.name;
		return finalSection;
	}

	if (section.children === undefined) return null;

	const sectionDeep = urlToSection(urlSections.slice(1), section.children);

	if (sectionDeep !== null && sectionDeep.sectionName === undefined) {
		sectionDeep.sectionName = section.name;
	}

	if (
		sectionDeep !== null &&
		sectionDeep.icon === undefined &&
		sectionDeep.sectionIcon === undefined &&
		section.icon !== undefined
	)
		sectionDeep.sectionIcon = section.icon;
	return sectionDeep;
}

function props(route: Route) {
	const section = urlToSection(urlSplitter(route.path), sections);
	return { section };
}

export default defineModule(({ i18n }) => ({
	id: 'docs',
	name: i18n.t('documentation'),
	icon: 'info',
	routes: [
		{
			path: '/*',
			beforeEnter: (to, from, next) => {
				if (to.path === '/docs/') next(defaultSection);
				else next();
			},
			component: Docs,
			props: props,
		},
	],
	order: 20,
}));
