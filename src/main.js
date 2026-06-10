import { configReady } from './configure.js';

// Initialize controller
var controller = new ScrollMagic.Controller();

// Define the animation for fading out as the content moves up
function fadeOutAnimation(section) {
	// Configure the animation
	var tween = gsap.timeline();
	tween.fromTo(
		'#' + section,
		{ autoAlpha: 1, scale: 1 },
		{ autoAlpha: 0, scale: 0.8, duration: 1 },
	);

	// Create a ScrollMagic scene
	new ScrollMagic.Scene({
		triggerElement: '#' + section + '-end',
		duration: '100%',
		triggerHook: 0.5,
	})
		.setTween(tween)
		.addTo(controller);
}

function wateredDownFadeOutAnimation(section) {
	// Configure the animation
	var tween = gsap.timeline();
	tween.fromTo(
		'#' + section,
		{ autoAlpha: 1, scale: 1 },
		{ autoAlpha: 0, scale: 0.8, duration: 1 },
	);

	// Create a ScrollMagic scene
	new ScrollMagic.Scene({
		triggerElement: '#' + section + '-end',
		duration: '100%',
		triggerHook: 0.25,
	})
		.setTween(tween)
		.addTo(controller);
}

// Apply the animation to each section
['bio', 'resume'].forEach(function (section) {
	fadeOutAnimation(section);
});

// Apply the watered down fade out animation to these sections
// to prevent the content from disappearing too quickly
// Note: 'explainer' section is currently commented out in HTML
['portfolio'].forEach(function (section) {
	wateredDownFadeOutAnimation(section);
});

// Hero title is now rendered statically with brand styling
// (lush highlight bar + gradient italic word). Animation handled in CSS.

// Get the current year for the footer
document.getElementById('current-year').textContent = new Date().getFullYear();

// Active section highlighting for side navigation
function highlightActiveSection() {
	const sections = document.querySelectorAll('section[id]');
	const navLinks = document.querySelectorAll('.side-nav-link');

	let currentSection = '';
	const scrollPosition = window.scrollY + 100; // Offset for navbar

	// Check if we're at the bottom of the page
	const isAtBottom =
		window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;

	// If at bottom, always highlight the last section (Contact)
	if (isAtBottom) {
		const lastSection = sections[sections.length - 1];
		if (lastSection) {
			currentSection = lastSection.getAttribute('id');
		}
	} else {
		// Normal scroll-based detection
		sections.forEach((section) => {
			const sectionTop = section.offsetTop;
			const sectionHeight = section.offsetHeight;

			if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
				currentSection = section.getAttribute('id');
			}
		});
	}

	navLinks.forEach((link) => {
		link.classList.remove('active');
		if (link.getAttribute('data-section') === currentSection) {
			link.classList.add('active');
		}
	});
}

// Run on scroll and page load
window.addEventListener('scroll', highlightActiveSection);
window.addEventListener('DOMContentLoaded', highlightActiveSection);

// // Parallax effect for hero section
const heroBg = document.querySelector('.hero-bg');
let ticking = false;
window.addEventListener(
	'scroll',
	() => {
		if (!heroBg || ticking) return;

		ticking = true;
		requestAnimationFrame(() => {
			const parallaxSpeed = 0.4;
			heroBg.style.transform = `translateY(${window.scrollY * parallaxSpeed}px`;
			ticking = false;
		});
	},
	{ passive: true },
);

// Stagger animations for experience list items
function initStaggerAnimations() {
	const experienceItems = document.querySelectorAll('.resume-item');

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add('animate-in');

					// Stagger the list items within this experience item
					const listItems = entry.target.querySelectorAll('.responsibilities li');
					listItems.forEach((item, index) => {
						item.style.animationDelay = `${0.1 * index}s`;
						item.classList.add('stagger-in');
					});

					observer.unobserve(entry.target);
				}
			});
		},
		{ threshold: 0.2 },
	);

	experienceItems.forEach((item) => {
		observer.observe(item);
	});
}

// Run after DOM is loaded and config.json is processed
document.addEventListener('DOMContentLoaded', async () => {
	// Wait for config.js to populate the experience section
	await configReady;
	initStaggerAnimations();
});

// Obfuscated contact information - decode on page load
function decodeContact() {
	const emailElement = document.getElementById('contact-email');
	const phoneElement = document.getElementById('contact-phone');

	if (emailElement) {
		const encodedEmail = emailElement.getAttribute('data-contact');
		const decodedEmail = atob(encodedEmail);
		emailElement.href = 'mailto:' + decodedEmail;
	}

	if (phoneElement) {
		const encodedPhone = phoneElement.getAttribute('data-contact');
		const decodedPhone = atob(encodedPhone);
		phoneElement.href = 'tel:' + decodedPhone;
	}
}

// Decode contact info on page load
document.addEventListener('DOMContentLoaded', decodeContact);

// Smooth scroll to sections with offset for navbar
document.addEventListener('DOMContentLoaded', () => {
	const navLinks = document.querySelectorAll('.side-nav-link, .navbar-nav .nav-link');
	const navbarHeight = 70; // Height of fixed navbar + some padding

	navLinks.forEach((link) => {
		link.addEventListener('click', function (e) {
			const href = this.getAttribute('href');

			// Only handle internal anchor links
			if (href && href.startsWith('#')) {
				e.preventDefault();

				const targetId = href.substring(1);
				const targetSection = document.getElementById(targetId);

				if (targetSection) {
					const targetPosition = targetSection.offsetTop - navbarHeight;

					window.scrollTo({
						top: targetPosition,
						behavior: 'smooth',
					});
				}
			}
		});
	});
});
