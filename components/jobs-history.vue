<script setup lang="ts">

const {data: jobs} = await useFetch('/api/jobs', {
  lazy: true,
  headers: useRequestHeaders(['cookie']),
});

function parseDate(date: Date | string): string {
  date = new Date(date);
  const curr_sec = addTrailingZero(date.getSeconds());
  const curr_min = addTrailingZero(date.getMinutes());
  const curr_hour = addTrailingZero(date.getHours());
  const curr_date = addTrailingZero(date.getDate());
  const curr_month = addTrailingZero(date.getMonth() + 1);
  const curr_year = addTrailingZero(date.getFullYear());

  return `${curr_hour}:${curr_min}:${curr_sec} ${curr_date}.${curr_month}.${curr_year}`;
}

function addTrailingZero(num: number): string | number {
  return num < 10 ? "0" + num : num;
}
</script>

<template>
  <table class="table is-narrow is-hoverable">
    <tbody>
    <tr v-for="job in jobs" :key="job.id">
      <td>{{ job.name }}:</td>
      <td>{{ parseDate(job.timestamp) }}</td>
    </tr>
    </tbody>
  </table>
</template>