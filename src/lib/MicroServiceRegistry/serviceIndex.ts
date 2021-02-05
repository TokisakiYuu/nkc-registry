const serviceItMap: {
  [serviceName: string]: loopGetElementIterator<string>
} = {};

/**
 * 生成器函数，遍历并无限循环获取数组元素，
 * 如果传入函数，函数必须返回数组，
 * 每次迭代都会执行这个函数，并将所有得到的数组视为同一个数组，并参与下标循环的计算
 * @param list 类似数组的对象
 */
function* loopGetElement<T>(list: ArrayLike<T> | (() => ArrayLike<T>)): loopGetElementIterator<T> {
  let index = 0;
  while(1) {
    const array = (typeof list === "function")? list() : list;
    const length = array.length;
    if(index >= length - 1) {
      index = 0;
    } else {
      index += 1;
    }
    yield array[index];
  }
}

export function getSocketIdBalanced(serviceName: string, socketIds: () => ArrayLike<string>): string | null {
  if(!serviceItMap[serviceName]) {
    serviceItMap[serviceName] = loopGetElement<string>(socketIds);

  }
  const it = serviceItMap[serviceName];
  return it.next().value || null;
}

type loopGetElementIterator<T> = Generator<T, void, unknown>
