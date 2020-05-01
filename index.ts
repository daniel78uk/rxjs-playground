import { from, forkJoin } from "rxjs";
import { flatMap, takeWhile, scan } from "rxjs/operators";

const isOdd = n => !!(n % 2);

const delayedPromise = (time, value) =>
  new Promise(resolve => {
    setTimeout(resolve.bind(null, value), time);
  });

const getRandomInt = () => Math.random() * 1000;

const takeFirstResolvingToTrueOrAllFalse = (urls, type) => {
  const obs$ = from(urls);

  const results$ = obs$.pipe(
    flatMap(url =>
      delayedPromise(getRandomInt(), {
        message: `Response from ${url}`,
        value: getRandomInt()
      })
    ),
    scan(
      (acc, curr) => {
        const { counter } = acc;
        const { value, message } = curr;

        return {
          ...acc,
          counter: counter + 1,
          lastValue: value,
          lastMessage: message
        };
      },
      { counter: 0, lastValue: false, lastMessage: "" }
    ),
    takeWhile(
      ({ counter, lastValue }) =>
        counter <= urls.length - 1 && lastValue === false,
      true
    )
  );

  return results$;
};

const urls = ["url-1", "url-2", "url-3", "url-4"];

const allQueries$ = forkJoin({
  foo: takeFirstResolvingToTrueOrAllFalse(urls, "foo"),
  bar: takeFirstResolvingToTrueOrAllFalse(urls, "bar")
});

allQueries$.subscribe(
  val => console.log("===>allQueries", val),
  err => console.log("===>allQueries", err),
  () => console.log("===>allQueries completed")
);
