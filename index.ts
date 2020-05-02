import { from, forkJoin } from "rxjs";
import { flatMap, takeWhile, scan } from "rxjs/operators";

const isOdd = n => !!(n % 2);

const delayedPromise = (time, value) =>
  new Promise(resolve => {
    setTimeout(resolve.bind(null, value), time);
  });

const getRandomInt = () => Math.random() * 1000;

const takeFirstResolvingToTrueOrAllFalse = urls => {
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

const types = ["foo", "bar"];

const allquerySource$ = types.reduce(
  (acc, type) => ({ ...acc, [type]: takeFirstResolvingToTrueOrAllFalse(urls) }),
  {}
);

const allQueries = forkJoin(allquerySource$)
  .toPromise()
  .then(res => console.log(res));
