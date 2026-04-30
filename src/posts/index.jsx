import activityLifecyclePost from './category/architecture/activityLifecycle.jsx';
import stateFlowVsSharedFlowPost from './category/coroutines/stateFlowVsSharedFlow.jsx';
import threadPoolsPost from './category/performance/threadPools.jsx';

export const posts = [stateFlowVsSharedFlowPost, activityLifecyclePost, threadPoolsPost];

export const categories = ['All', ...Array.from(new Set(posts.map((post) => post.category)))];
