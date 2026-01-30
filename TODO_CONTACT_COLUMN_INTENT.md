# Contact Page - "Column of Intent" Implementation ✅ COMPLETED

## Task: Create minimalist single-column contact form with floating labels

### Implementation Steps

#### 1. Update `contact.html`

- [x] Replace hero section with minimalist header
- [x] Implement single centered column form (50% width desktop, 90% mobile)
- [x] Add floating labels positioned on the line
- [x] Add "Coordinates" sidebar with contact details
- [x] Add minimalist ghost button
- [x] Include GSAP animations inline for focus states and form submission

#### 2. Update `styles/contact.css`

- [x] Form container: 50% width centered, 90% mobile
- [x] Input fields: transparent background, 1px bottom border (#1A1A1A)
- [x] Labels: 0.7rem Sans-Serif, 0.2em letter-spacing, uppercase
- [x] Floating label: positioned on line, transitions upward on focus/valid
- [x] Focus state: border draws from center (scaleX), color changes to gold
- [x] Ghost button: thin border, 2px up movement on hover
- [x] Coordinates sidebar: hushed styling for contact info

#### 3. Update `scripts/animations.js`

- [x] GSAP focus animation: border-bottom color → muted gold (#8b9a7d)
- [x] scaleX transform for center-out border drawing
- [x] Floating label: label shrinks and moves upward on input
- [x] Emily Ease: cubic-bezier(0.16, 1, 0.3, 1)

### Design Specifications

| Feature              | Value                                    |
| -------------------- | ---------------------------------------- |
| Border               | 1px solid #1A1A1A (bottom only)          |
| Label font-size      | 0.7rem                                   |
| Label letter-spacing | 0.2em                                    |
| Label transform      | uppercase                                |
| Gold accent          | #8b9a7d (editorial-accent)               |
| Form width           | 50% desktop, 90% mobile                  |
| Button hover         | border thickens 0.5px, text moves up 2px |

### Sections to Create

1. **Header**: Minimal page header with menu
2. **Page Title**: "Contact" or "Get in Touch"
3. **Main Content**: Grid with form (left) + coordinates (right)
4. **Form Fields**: Name, Email, Phone, Subject, Message
5. **Coordinates**: Phone, Email, Address
6. **Submit Button**: "Send Inquiry" ghost button

### Status: Ready to Implement
