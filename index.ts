import { from, forkJoin } from "rxjs";
import { flatMap, takeWhile, scan } from "rxjs/operators";

/*
 The scope of this exercise is to get the first resolving promise to true.
 Promises might return all false so it has to wait in that case for all to resolve.
*/

const isOdd = n => !!(n % 2);

const delayedPromise = (time, value) =>
  new Promise(resolve => {
    setTimeout(resolve.bind(null, value), time);
  });

const getRandomInt = () => Math.floor(Math.random() * 1000);

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

const checkTrueOrAllFalse = maxCount => ({ counter, lastValue }) =>
  counter <= maxCount.length - 1 && lastValue === false;

const takeFirstResolvingToTrueOrAllFalse = urls =>
  from(urls).pipe(
    flatMap(url =>
      delayedPromise(getRandomInt(), {
        message: `Response from ${url}`,
        value: isOdd(getRandomInt())
      })
    ),
    scan(scanStepper, { counter: 0 }),
    takeWhile(checkTrueOrAllFalse(urls), true) // this is an RxJs thing, if you dont pass the additional param true it will not emit the values
  );

const urls = ["url-1", "url-2", "url-3", "url-4"];

const types = ["foo", "bar"];

const allQuerySources$ = types.reduce(
  (acc, type) => ({ ...acc, [type]: takeFirstResolvingToTrueOrAllFalse(urls) }),
  {}
);

const allQueries = forkJoin(allQuerySources$)
  .toPromise() 
  .then(res => console.log(res));
