1. **Safe order to remove @ts-nocheck:**
   - Start with `pages/_app.tsx` and `_document.tsx`.
   - Then move on to layout files like `components/Layout.tsx`.
   - Next, tackle individual page components.
   - Finally, address utility functions and hooks.

2. **3 ESLint rules matter most for enterprise React:**
   - `react-hooks/rules-of-hooks`: Ensures that React Hooks are used correctly.
   - `react/react-in-jsx-scope`: Ensures that React is in scope when using JSX.
   - `@typescript-eslint/no-explicit-any`: Prevents the use of `any` type to improve type safety.

3. **How to reduce bundle size - what to audit first:**
   - Use tools like `webpack-bundle-analyzer` to identify large dependencies.
   - Remove unused packages and dependencies.
   - Optimize images and other assets.
   - Consider tree-shaking by using ES modules where possible.

4. **What Web Vitals scores should this portal target?**
   - Largest Contentful Paint (LCP): < 2.5 seconds
   - First Input Delay (FID): < 100 milliseconds
   - Cumulative Layout Shift (CLS): < 0.1

5. **3 missing components would most improve UX:**
   - A loading spinner for asynchronous data fetching.
   - A modal component for dialogs and forms.
   - A notification system for feedback messages.
