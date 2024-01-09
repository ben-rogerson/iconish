/* eslint-disable tsdoc/syntax */
/**
 * Immediately run a function and return its result.
 * Can be used as an `IIFE` or a `do` expression.
 * @see https://maxgreenwald.me/blog/do-more-with-run
 *
 * @example
 * // Conditionally assign a value.
 * // Useful to avoid temporary variable assignments.
 * const fooBar = run(() => {
 *  return someCondition() ? "foo" : "bar";
 * });
 *
 * // Top-level await.
 * const fooBar = run(async () => {
 *  const res = await fetch("https://example.com");
 *  return res.json();
 * });
 *
 * // Avoid nested ternaries in JSX.
 * <div>
 *   {run(() => {
 *     if (status === "loading") return <LoadingPage />
 *     if (status === "signed-out") return <SignUpPage />
 *     if (status === "onboarding") return <OnboardingPage />
 *
 *     return <DashboardPage user={user} />
 *   })}
 * </div>
 *
 * @param fn The function to run.
 * @returns The return value of the function.
 */
export const run = <T>(fn: () => T): T => fn()
