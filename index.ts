import { from, forkJoin } from "rxjs";
import { flatMap, takeWhile, scan } from "rxjs/operators";

const isOdd = n => !!(n % 2);

const delayedPromise = (time, value) =>
  new Promise(resolve => {
    setTimeout(resolve.bind(null, value), time);
  });

const getRandomInt = () => Math.random() * 1000;

const scanStepper = (acc, curr) => {
  const { counter } = acc;
  const { value, message } = curr;

  return {
    ...acc,
    counter: counter + 1,
    lastValue: value,
    lastMessage: message
  };
};

const takeTrueOrAllFalse = ({ counter, lastValue }) =>
  counter <= urls.length - 1 && lastValue === false;

const takeFirstResolvingToTrueOrAllFalse = urls =>
  from(urls).pipe(
    flatMap(url =>
      delayedPromise(getRandomInt(), {
        message: `Response from ${url}`,
        value: isOdd(getRandomInt())
      })
    ),
    scan(scanStepper, { counter: 0, lastValue: false, lastMessage: "" }),
    takeWhile(takeTrueOrAllFalse, true)
  );

const urls = ["url-1", "url-2", "url-3", "url-4"];

const types = ["foo", "bar"];

const allquerySources$ = types.reduce(
  (acc, type) => ({ ...acc, [type]: takeFirstResolvingToTrueOrAllFalse(urls) }),
  {}
);

const allQueries = forkJoin(allquerySources$)
  .toPromise()
  .then(res => console.log(res));
