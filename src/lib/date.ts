export type Day = 'SUN' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT'

export function getCurrentDayOfTheWeek(): Day {
  return dateToDay(new Date())
}

export function dateToDay(date: Date): Day {
  const day = date.getDay()
  switch (day) {
    case 0:
      return 'SUN'
    case 1:
      return 'MON'
    case 2:
      return 'TUE'
    case 3:
      return 'WED'
    case 4:
      return 'THU'
    case 5:
      return 'FRI'
    case 6:
      return 'SAT'
  }

  return 'SUN'
}
