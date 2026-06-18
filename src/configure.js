// Description: This file contains the configuration for the resume page.
//
import { computeCompanyTenure, getInitials, roleDuration } from './experienceUtils.js';

function buildCompanyLogo(experience) {
	const logoWrap = document.createElement('div');
	logoWrap.classList.add('company-logo');

	if (experience.logoBackground) {
		logoWrap.style.backgroundColor = experience.logoBackground;
	}

	if (experience.logo) {
		const img = document.createElement('img');
		img.src = experience.logo;
		img.alt = `${experience.organization} logo`;
		img.loading = 'lazy';
		img.addEventListener('error', () => {
			logoWrap.innerHTML = '';
			logoWrap.classList.add('company-logo-fallback');
			const initials = document.createElement('span');
			initials.classList.add('company-logo-initials');
			initials.textContent = getInitials(experience.organization);
			logoWrap.appendChild(initials);
		});
		logoWrap.appendChild(img);
	} else {
		logoWrap.classList.add('company-logo-fallback');
		const initials = document.createElement('span');
		initials.classList.add('company-logo-initials');
		initials.textContent = getInitials(experience.organization);
		logoWrap.appendChild(initials);
	}
	return logoWrap;
}

function buildRoleItem(role) {
	const item = document.createElement('li');
	item.classList.add('role-item');

	const marker = document.createElement('span');
	marker.classList.add('role-marker');
	marker.setAttribute('aria-hidden', 'true');
	item.appendChild(marker);

	const content = document.createElement('div');
	content.classList.add('role-content');

	const title = document.createElement('h4');
	title.classList.add('role-title');
	title.textContent = role.title;
	content.appendChild(title);

	const meta = document.createElement('p');
	meta.classList.add('role-meta');
	const date = document.createElement('span');
	date.classList.add('role-date');
	date.textContent = role.date;
	meta.appendChild(date);

	const duration = roleDuration(role);
	if (duration) {
		const sep = document.createElement('span');
		sep.classList.add('role-sep');
		sep.setAttribute('aria-hidden', 'true');
		sep.textContent = '·';
		meta.appendChild(sep);
		const dur = document.createElement('span');
		dur.classList.add('role-duration');
		dur.textContent = duration;
		meta.appendChild(dur);
	}

	if (role.location) {
		const sep = document.createElement('span');
		sep.classList.add('role-sep');
		sep.setAttribute('aria-hidden', 'true');
		sep.textContent = '·';
		meta.appendChild(sep);
		const loc = document.createElement('span');
		loc.classList.add('role-location');
		loc.textContent = role.location;
		meta.appendChild(loc);
	}
	content.appendChild(meta);

	if (role.description && role.description.length) {
		const ul = document.createElement('ul');
		ul.classList.add('responsibilities');
		role.description.forEach((line) => {
			const li = document.createElement('li');
			li.innerHTML = line;
			ul.appendChild(li);
		});
		content.appendChild(ul);
	}

	item.appendChild(content);
	return item;
}

function buildCompanyCard(experience) {
	const card = document.createElement('article');
	card.classList.add('company-card', 'resume-item');

	const header = document.createElement('header');
	header.classList.add('company-header');
	header.appendChild(buildCompanyLogo(experience));

	const info = document.createElement('div');
	info.classList.add('company-info');

	const name = document.createElement('h3');
	name.classList.add('company-name');
	name.textContent = experience.organization;
	info.appendChild(name);

	const tenure = computeCompanyTenure(experience.roles || []);
	if (tenure) {
		const tenureEl = document.createElement('p');
		tenureEl.classList.add('company-tenure');
		tenureEl.textContent = tenure;
		info.appendChild(tenureEl);
	}

	header.appendChild(info);
	card.appendChild(header);

	const timeline = document.createElement('ol');
	timeline.classList.add('role-timeline');
	(experience.roles || []).forEach((role) => {
		timeline.appendChild(buildRoleItem(role));
	});
	if ((experience.roles || []).length <= 1) {
		timeline.classList.add('role-timeline-single');
	}
	card.appendChild(timeline);

	return card;
}

function buildPortfolioCard(project) {
	const portfolioItem = document.createElement('div');
	portfolioItem.classList.add('portfolio-item');

	const imageContainer = document.createElement('div');
	imageContainer.classList.add('portfolio-image-container');
	const img = document.createElement('img');
	img.src = project.image;
	img.alt = `${project.name} image`;
	img.classList.add('portfolio-image');
	img.style.objectPosition = `0 ${project.position}`;
	imageContainer.appendChild(img);

	const description = document.createElement('div');
	description.classList.add(
		'portfolio-description',
		'd-flex',
		'flex-column',
		'justify-content-between',
		'align-items-start',
	);
	const header = document.createElement('div');
	header.classList.add('portfolio-header', 'justify-content-between');
	const detail = document.createElement('div');
	detail.classList.add('d-flex', 'flex-column', 'gap-2', 'align-items-start');

	const name = document.createElement('h3');
	name.classList.add('portfolio-title');
	name.textContent = project.name;
	const date = document.createElement('span');
	date.classList.add('small');
	date.textContent = project.date;
	header.appendChild(name);
	header.appendChild(date);

	const role = document.createElement('span');
	role.classList.add(
		'border',
		'border-1',
		'rounded-pill',
		'px-3',
		'py-1',
		'text-bg-light',
		'fw-bold',
	);
	role.textContent = project.role;
	const descriptionBody = document.createElement('p');
	descriptionBody.classList.add('m-0');
	descriptionBody.textContent = project.description;
	detail.appendChild(role);
	detail.appendChild(descriptionBody);

	description.appendChild(header);
	description.appendChild(detail);

	portfolioItem.appendChild(imageContainer);
	portfolioItem.appendChild(description);

	return portfolioItem;
}

export async function loadConfig(lang) {
	if (document.readyState === 'loading') {
		await new Promise((resolve) =>
			document.addEventListener('DOMContentLoaded', resolve, { once: true }),
		);
	}

	const response = await fetch(`public/config-${lang}.json`);
	const data = await response.json();

	const bioSection = document.getElementById('bio-section');
	bioSection.innerHTML = data.personal_info.bio;

	const portfolioGrid = document.getElementById('portfolio-grid');
	portfolioGrid.innerHTML = '';
	data.projects.forEach((project) => {
		portfolioGrid.appendChild(buildPortfolioCard(project));
	});

	// Generate Skills Section
	const skillsSection = document.getElementById('skills-section');
	skillsSection.innerHTML = '';

	data.skills.forEach((skill) => {
		const skillItem = document.createElement('div');
		skillItem.classList.add('resume-item', 'd-flex', 'gap-2', 'align-items-center', 'col-auto');

		// const skillIcon = document.createElement('img');
		// skillIcon.classList.add('skill-icon', 'rounded-3');
		// skillIcon.width = '32';
		// skillIcon.height = '32';
		// skillIcon.src = `${skill.icon}`;

		const skillName = document.createElement('h4');
		skillName.classList.add(
			'skill-header',
			'border',
			'border-1',
			'rounded-pill',
			'm-0',
			'py-2',
			'px-3',
		);
		skillName.textContent = `${skill}`;

		// skillItem.appendChild(skillIcon);
		skillItem.appendChild(skillName);

		skillsSection.appendChild(skillItem);
	});

	// Generate Education Section
	const educationSection = document.getElementById('education-section');
	educationSection.innerHTML = '';
	data.education.forEach((item) => {
		const educationItem = document.createElement('div');
		educationItem.classList.add('resume-item');

		const header = document.createElement('div');
		header.classList.add(
			'd-flex',
			'flex-column',
			'flex-sm-row',
			'justify-content-between',
			'align-items-start',
			'align-items-sm-center',
		);
		const degree = document.createElement('h4');
		degree.classList.add('degree', 'fs-6', 'm-0');
		degree.textContent = item.degree;
		const date = document.createElement('p');
		date.classList.add('date-range', 'm-0');
		date.textContent = item.date;
		header.appendChild(degree);
		header.appendChild(date);

		const field = document.createElement('div');
		field.classList.add(
			'resume-header',
			'd-flex',
			'justify-content-start',
			'align-items-center',
			'lh-1',
			'mb-2',
		);
		field.textContent = item.field;

		const institutionDetails = document.createElement('div');
		institutionDetails.classList.add(
			'd-flex',
			'flex-column',
			'flex-sm-row',
			'justify-content-between',
			'align-items-start',
			'align-items-sm-center',
		);
		const institution = document.createElement('p');
		institution.classList.add('company-details', 'mb-2');
		institution.textContent = item.university;
		const location = document.createElement('p');
		location.classList.add('location');
		location.textContent = item.location;
		institutionDetails.appendChild(institution);
		institutionDetails.appendChild(location);

		const grade = document.createElement('div');
		grade.classList.add('d-flex', 'align-items-center', 'gap-1', 'fst-italic', 'small');
		grade.textContent = 'GPA:';
		const gradeValue = document.createElement('span');
		gradeValue.textContent = item.grade;
		grade.appendChild(gradeValue);

		educationItem.appendChild(header);
		educationItem.appendChild(field);
		educationItem.appendChild(institutionDetails);
		educationItem.appendChild(grade);

		educationSection.appendChild(educationItem);
	});

	// Generate Experience Section (grouped by company)
	const experienceSection = document.getElementById('experience-section');
	experienceSection.innerHTML = '';
	data.experiences.forEach((experience) => {
		experienceSection.appendChild(buildCompanyCard(experience));
	});

	// const journeySection = document.getElementById('journey');
	// data.journey.forEach((item) => {
	// 	const itemEl = document.createElement('div');
	// 	itemEl.classList.add('journey-item');
	// 	const container = document.createElement('div');
	// 	container.classList.add('journey-container', 'py-3', 'px-4', 'border', 'border-1', 'rounded-4');

	// 	const title = document.createElement('h4');
	// 	title.classList.add('journey-title');
	// 	title.textContent = item.title;
	// 	container.appendChild(title);

	// 	const list = document.createElement('ul');
	// 	list.classList.add('journey-ul', 'responsibilities');
	// 	item.content.forEach((line) => {
	// 		const li = document.createElement('li');
	// 		li.classList.add('journey-li');
	// 		li.textContent = line;
	// 		list.appendChild(li);
	// 	});
	// 	container.appendChild(list);

	// 	itemEl.appendChild(container);

	// 	journeySection.appendChild(itemEl);
	// });

	const journeySection = document.getElementById('journey-list');
	data.journey.forEach((item) => {
		const itemEl = document.createElement('div');
		itemEl.classList.add('journey-item');
		itemEl.role = 'listitem';
		const container = document.createElement('div');
		container.classList.add(
			'journey-item-container',
			'border',
			'border-1',
			'rounded-top-0',
			'rounded-4',
		);

		const contentEl = document.createElement('div');
		contentEl.classList.add(
			'journey-content',
			// 'py-3',
			// 'px-4',
			// 'border',
			// 'border-1',
			// 'rounded-4',
		);

		const title = document.createElement('h3');
		title.classList.add('journey-title');
		title.textContent = item.title;
		contentEl.appendChild(title);

		const desUl = document.createElement('ul');
		desUl.classList.add('journey-ul', 'responsibilities', 'm-0');
		item.content.forEach((line) => {
			const li = document.createElement('li');
			li.classList.add('journey-li');
			li.textContent = line;
			desUl.appendChild(li);
		});
		contentEl.appendChild(desUl);
		container.appendChild(contentEl);

		// const imgEl = document.createElement('img');
		// imgEl.classList.add('journey-img');
		// imgEl.height = '100px';
		// imgEl.src = item.img;
		// container.appendChild(imgEl);
		const dateEl = document.createElement('span');
		dateEl.classList.add('journey-date');
		dateEl.textContent = item.date;
		container.appendChild(dateEl);

		itemEl.appendChild(container);
		journeySection.appendChild(itemEl);
	});

	const clientsSlider = document.getElementById('clients-slider');
	data.clients.forEach((client) => {
		const clientSlide = document.createElement('div');
		clientSlide.classList.add('slide');
		clientSlide.innerHTML = `<img src="${client.logo}" height="150" width="150" alt="${client.name}" /><span class="client-name">${client.name}</span>`;
		clientsSlider.appendChild(clientSlide);
	});
	clientsSlider.style.width = `${150 * data.clients.length}px`;
}
