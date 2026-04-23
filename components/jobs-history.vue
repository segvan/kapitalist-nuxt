<script setup lang="ts">

import {useApi} from "~/composables/useApi";
import type {JobsModel} from "~/lib/apiModels";

const {data: jobs, status, error, refresh} = await useApi<JobsModel[]>('/api/jobs');

if (error.value?.statusCode === 401) {
  navigateTo('/login');
}

const running = ref<string | null>(null);
const runError = ref<string | null>(null);

async function runJob(name: string) {
  running.value = name;
  runError.value = null;
  try {
    await $fetch(`/api/jobs/${name}`, { method: 'POST' });
    await refresh();
  } catch (e) {
    runError.value = (e as { data?: { message?: string } })?.data?.message ?? 'Failed to run job';
  } finally {
    running.value = null;
  }
}

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
  <app-external-data-loader :condition="status==='pending'" :number-of-lines="4" :lines-width="30" :error-message="error?.data?.message">
    <p v-if="runError" class="has-text-danger is-size-7 mb-2">{{ runError }}</p>
    <div class="table-container">
    <table class="table is-fullwidth is-narrow is-hoverable">
      <tbody>
      <tr v-for="job in jobs" :key="job.id">
        <td>{{ job.name }}:</td>
        <td>{{ parseDate(job.timestamp) }}</td>
        <td class="has-text-right">
          <button
            class="button is-small is-success"
            :class="{ 'is-loading': running === job.name }"
            :disabled="running !== null"
            @click="runJob(job.name)"
          >Run</button>
        </td>
      </tr>
      </tbody>
    </table>
    </div>
  </app-external-data-loader>
</template>