# KNOWN_PROBLEMS.md

## P0 — Critical (blocking)

| ID | Severity | Area | Problem | Impact | Resolution |
|----|----------|------|---------|--------|------------|
| 1  | P0       | UI   | Top Navigation Bar does not support keyboard navig[5D[K
navigation. | Users with disabilities may struggle to navigate using assist[6D[K
assistive technologies. | Implement keyboard navigation for all interactive[11D[K
interactive elements in the top navigation bar. |
| 2  | P0       | UX   | Breadcrumb truncation logic is inconsistent across[6D[K
across different screens and devices. | Different users may experience diff[4D[K
difficulties understanding their current location due to inconsistent bread[5D[K
breadcrumb behavior. | Standardize breadcrumb truncation logic based on scr[3D[K
screen size and device type. |

## P1 — High (must fix soon)

| ID | Severity | Area | Problem | Impact | Resolution |
|----|----------|------|---------|--------|------------|
| 3  | P1       | Mobile UX | Bottom Tab Bar iconography is not intuitive f[1D[K
for all users. | Some users may find it difficult to understand the purpose[7D[K
purpose of certain tabs on smaller screens. | Revise tab icons and labels t[1D[K
to be more universally understandable. |
| 4  | P1       | Accessibility | Top Navigation Bar notification bell does[4D[K
does not provide sufficient contrast or ARIA attributes for screen readers.[8D[K
readers. | Users with visual impairments may miss important notifications. [K
| Ensure the notification bell has high contrast and provides appropriate A[1D[K
ARIA attributes for better accessibility. |

## P2 — Medium (tech debt)

| ID | Severity | Area | Problem | Impact | Resolution |
|----|----------|------|---------|--------|------------|
| 5  | P2       | Documentation vs Code | Inconsistent documentation of nav[3D[K
navigation patterns between frontend and backend code. | Developers may get[3D[K
get confused while implementing or maintaining navigation logic. | Synchron[8D[K
Synchronize documentation with the actual implementation in both frontend a[1D[K
and backend code. |
| 6  | P2       | Test Coverage | Lack of test coverage for mobile bottom t[1D[K
tab bar functionality. | Bugs related to mobile navigation may not be detec[5D[K
detected during testing phases. | Add unit tests and integration tests spec[4D[K
specifically targeting mobile bottom tab bar interactions. |

## Architecture Inconsistencies Found

1. **Inconsistent Use of Navigation Libraries**: The frontend and backend u[1D[K
use different libraries for handling navigation, leading to discrepancies i[1D[K
in how navigation patterns are implemented across the application.
2. **Lack of Centralized Navigation Logic**: There is no centralized locati[6D[K
location where all navigation logic is defined, making it difficult to main[4D[K
maintain consistency and update navigation patterns uniformly.

## Documentation vs Code Gaps

1. **Top Navigation Bar Behavior**: The documentation for the top navigatio[9D[K
navigation bar describes its functionality but lacks details on how keyboar[7D[K
keyboard navigation should be implemented.
2. **Bottom Tab Bar Icons**: The documentation does not provide a comprehen[9D[K
comprehensive list of icons used in the bottom tab bar, making it challengi[9D[K
challenging for developers to understand their purpose and usage.

## Missing Test Coverage Areas

1. **Mobile Navigation on Edge Cases**: There is no test coverage for edge [K
cases such as navigating through all sub-items in the top navigation bar or[2D[K
or using the bottom tab bar on different screen sizes.
2. **Breadcrumb Interaction**: The current test suite lacks tests to ensure[6D[K
ensure that breadcrumbs are displayed correctly and are accessible via keyb[4D[K
keyboard and assistive technologies.

### Reality: # Navigation Patterns

#### Pattern 1: Top Navigation Bar (All Authenticated Portals)

- **Issue**: The top navigation bar does not support keyboard navigation.
- **Impact**: Users with disabilities may struggle to navigate using assist[6D[K
assistive technologies.
- **Resolution**: Implement keyboard navigation for all interactive element[7D[K
elements in the top navigation bar.

#### Pattern 2: Tab Navigation (Detail Pages)

- **Issue**: There is no test coverage for mobile bottom tab bar functional[10D[K
functionality.
- **Impact**: Bugs related to mobile navigation may not be detected during [K
testing phases.
- **Resolution**: Add unit tests and integration tests specifically targeti[7D[K
targeting mobile bottom tab bar interactions.

